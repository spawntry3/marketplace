import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/user.entity';
import { ReviewComment } from './review-comment.entity';

@Entity('product_reviews')
@Unique(['userId', 'productId'])
export class ProductReview {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  productId!: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /** 1–5 */
  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text' })
  text!: string;

  @OneToMany(() => ReviewComment, (c) => c.review, { cascade: false })
  comments!: ReviewComment[];

  @CreateDateColumn()
  createdAt!: Date;
}
