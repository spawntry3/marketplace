import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductReview } from './product-review.entity';
import { User } from '../../users/user.entity';

@Entity('review_comments')
export class ReviewComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  reviewId!: number;

  @ManyToOne(() => ProductReview, (r) => r.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewId' })
  review!: ProductReview;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
