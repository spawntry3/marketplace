import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateReviewCommentDto {
  @IsString()
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(2000)
  text!: string;
}
