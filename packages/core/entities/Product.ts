// entities/Product.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OrderItem } from './OrderItem';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'json', nullable: true })
  specifications?: object;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}
