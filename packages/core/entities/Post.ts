
// entities/Post.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Category } from './Category';
import { Comment } from './Comment';
import { Tag } from './Tag';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  slug?: string;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @ManyToOne(() => Category, category => category.posts)
  category: Category;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable()
  tags: Tag[];
}