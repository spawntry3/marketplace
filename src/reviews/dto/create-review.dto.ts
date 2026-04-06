import { IsInt, Max, Min, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(10, { message: 'Текст отзыва не короче 10 символов' })
  @MaxLength(4000)
  text!: string;
}
