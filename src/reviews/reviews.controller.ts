import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReviewCommentDto } from './dto/create-review-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type JwtReq = Request & { user: { userId: string; email: string } };

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  getForProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getProductReviewBundle(productId);
  }

  @Get('recommendations/for-product/:productId')
  getRecommendations(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getRecommendationsForProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('product/:productId')
  createReview(
    @Req() req: JwtReq,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.userId, productId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:reviewId')
  addComment(
    @Req() req: JwtReq,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: CreateReviewCommentDto,
  ) {
    return this.reviewsService.addComment(req.user.userId, reviewId, dto);
  }
}
