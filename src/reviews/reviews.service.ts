import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductReview } from './entities/product-review.entity';
import { ReviewComment } from './entities/review-comment.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || !local) return '***';
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}***@${domain}`;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepository: Repository<ProductReview>,
    @InjectRepository(ReviewComment)
    private readonly commentRepository: Repository<ReviewComment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProductReviewBundle(productId: number) {
    await this.ensureProduct(productId);

    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['user', 'comments', 'comments.user'],
      order: { createdAt: 'DESC' },
    });

    for (const r of reviews) {
      r.comments?.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    const stat = await this.reviewRepository
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(r.id)', 'cnt')
      .where('r.productId = :pid', { pid: productId })
      .getRawOne<{ avg: string | null; cnt: string | null }>();

    const averageRating =
      stat?.avg != null ? Math.round(Number(stat.avg) * 10) / 10 : 0;
    const totalReviews = stat?.cnt != null ? Number(stat.cnt) : 0;

    return {
      averageRating,
      totalReviews,
      reviews: reviews.map((r) => this.serializeReview(r)),
    };
  }

  async createReview(userId: string, productId: number, dto: CreateReviewDto) {
    await this.ensureProduct(productId);

    const existing = await this.reviewRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException(
        'Вы уже оставили отзыв на этот товар. Можно добавить комментарий к чужим отзывам.',
      );
    }

    const review = this.reviewRepository.create({
      userId,
      productId,
      rating: dto.rating,
      text: dto.text.trim(),
    });
    const saved = await this.reviewRepository.save(review);
    const full = await this.reviewRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'comments', 'comments.user'],
    });
    return this.serializeReview(full!);
  }

  async addComment(
    userId: string,
    reviewId: number,
    dto: CreateReviewCommentDto,
  ) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    const comment = this.commentRepository.create({
      reviewId,
      userId,
      text: dto.text.trim(),
    });
    const saved = await this.commentRepository.save(comment);
    const withUser = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    return this.serializeComment(withUser!);
  }

  async getRecommendationsForProduct(
    productId: number,
    limit = 6,
  ): Promise<Product[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Товар с ID ${productId} не найден`);
    }

    let candidates: Product[];
    if (product.category) {
      const sameCat = await this.productRepository.find({
        where: { category: product.category },
      });
      candidates = sameCat.filter((p) => p.id !== productId);
    } else {
      candidates = [];
    }

    if (candidates.length === 0) {
      const all = await this.productRepository.find();
      candidates = all.filter((p) => p.id !== productId);
    }

    const ids = candidates.map((p) => p.id);
    if (ids.length === 0) return [];

    const raw = await this.reviewRepository
      .createQueryBuilder('r')
      .select('r.productId', 'productId')
      .addSelect('AVG(r.rating)', 'avg')
      .where('r.productId IN (:...ids)', { ids })
      .groupBy('r.productId')
      .getRawMany<{ productId: number; avg: string }>();

    const avgMap = new Map<number, number>();
    for (const row of raw) {
      avgMap.set(Number(row.productId), Number(row.avg));
    }

    candidates.sort((a, b) => {
      const av = avgMap.get(a.id) ?? 0;
      const bv = avgMap.get(b.id) ?? 0;
      if (bv !== av) return bv - av;
      return a.id - b.id;
    });

    return candidates.slice(0, limit);
  }

  private async ensureProduct(productId: number) {
    const ok = await this.productRepository.exist({ where: { id: productId } });
    if (!ok) {
      throw new NotFoundException(`Товар с ID ${productId} не найден`);
    }
  }

  private serializeReview(r: ProductReview) {
    return {
      id: r.id,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
      author: maskEmail(r.user?.email ?? ''),
      comments: (r.comments ?? []).map((c) => this.serializeComment(c)),
    };
  }

  private serializeComment(c: ReviewComment) {
    return {
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      author: maskEmail(c.user?.email ?? ''),
    };
  }
}
