// entities/Category.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 0 })
  orderIndex: number;

  @OneToMany(() => Post, post => post.category)
  posts: Post[];

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];
}
