export interface ReviewComment {
  id: number;
  text: string;
  createdAt: string;
  author: string;
}

export interface ProductReviewItem {
  id: number;
  rating: number;
  text: string;
  createdAt: string;
  author: string;
  comments: ReviewComment[];
}

export interface ProductReviewBundle {
  averageRating: number;
  totalReviews: number;
  reviews: ProductReviewItem[];
}
