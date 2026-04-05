import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 }) 
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 }) 
  stock!: number;

  @Column({ type: 'varchar', nullable: true }) 
  category?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl?: string | null;
}