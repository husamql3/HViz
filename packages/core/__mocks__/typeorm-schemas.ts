// Mock TypeORM entity schemas for testing

export const simpleTypeORMSchema = {
  "User.ts": `
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Post } from './Post';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name?: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}
`,
  "Post.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @ManyToOne(() => User, user => user.posts)
  author: User;
}
`,
};

export const mediumTypeORMSchema = {
  "User.ts": `
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { Profile } from './Profile';
import { Post } from './Post';
import { Comment } from './Comment';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];
}
`,
  "Profile.ts": `
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar?: string;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}
`,
  "Post.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Comment } from './Comment';
import { Category } from './Category';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable()
  categories: Category[];
}
`,
  "Comment.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Post, post => post.comments)
  post: Post;

  @ManyToOne(() => User, user => user.comments)
  author: User;
}
`,
  "Category.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Post, post => post.categories)
  posts: Post[];
}
`,
};

export const complexTypeORMSchema = {
  "User.ts": `
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { Profile } from './Profile';
import { Settings } from './Settings';
import { Post } from './Post';
import { Comment } from './Comment';
import { Like } from './Like';
import { Follow } from './Follow';
import { Notification } from './Notification';
import { Message } from './Message';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 'USER' })
  role: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;

  @OneToOne(() => Settings, settings => settings.user)
  settings: Settings;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, like => like.user)
  likes: Like[];

  @OneToMany(() => Follow, follow => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  followers: Follow[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];
}
`,
  "Profile.ts": `
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;
}
`,
  "Settings.ts": `
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => User, user => user.settings)
  @JoinColumn()
  user: User;
}
`,
  "Post.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Comment } from './Comment';
import { Like } from './Like';
import { Tag } from './Tag';
import { Category } from './Category';
import { Media } from './Media';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @ManyToOne(() => User, user => user.posts)
  author: User;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, like => like.post)
  likes: Like[];

  @OneToMany(() => Media, media => media.post)
  media: Media[];

  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable()
  categories: Category[];
}
`,
  "Comment.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Post } from './Post';
import { User } from './User';
import { Like } from './Like';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Post, post => post.comments)
  post: Post;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
  parent?: Comment;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];

  @OneToMany(() => Like, like => like.comment)
  likes: Like[];
}
`,
  "Like.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Post } from './Post';
import { Comment } from './Comment';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.likes)
  user: User;

  @ManyToOne(() => Post, post => post.likes, { nullable: true })
  post?: Post;

  @ManyToOne(() => Comment, comment => comment.likes, { nullable: true })
  comment?: Comment;
}
`,
  "Follow.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.following)
  follower: User;

  @ManyToOne(() => User, user => user.followers)
  following: User;
}
`,
  "Tag.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
}
`,
  "Category.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Post, post => post.categories)
  posts: Post[];
}
`,
  "Media.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Post } from './Post';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  type: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Post, post => post.media)
  post: Post;
}
`,
  "Notification.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.notifications)
  user: User;
}
`,
  "Message.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages)
  receiver: User;
}
`,
};

export const singleTableTypeORMSchema = {
  "Product.ts": `
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
`,
};

export const selfReferencingTypeORMSchema = {
  "Category.ts": `
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Category, category => category.children, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];
}
`,
};

// Generate large schema for stress testing
export const generateLargeTypeORMSchema = (numTables: number): Record<string, string> => {
  const schema: Record<string, string> = {};

  for (let i = 0; i < numTables; i++) {
    const entityName = `Entity${i}`;
    const fileName = `${entityName}.ts`;

    let imports = `import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';\n`;
    let relations = "";
    let relationsFields = "";

    // Add relation to previous entity
    if (i > 0) {
      const prevEntity = `Entity${i - 1}`;
      imports += `import { ${prevEntity} } from './${prevEntity}';\n`;
      relationsFields += `
  @ManyToOne(() => ${prevEntity}, entity => entity.children)
  parent: ${prevEntity};
`;
    }

    // Add relation to next entity (will be added when next entity is created)
    relationsFields += `
  @OneToMany(() => ${entityName}, entity => entity.parent)
  children: ${entityName}[];
`;

    // Add cross reference
    if (i > 2 && i % 3 === 0) {
      const relatedEntity = `Entity${Math.floor(i / 2)}`;
      imports += `import { ${relatedEntity} } from './${relatedEntity}';\n`;
      relationsFields += `
  @ManyToOne(() => ${relatedEntity}, entity => entity.relatedEntities)
  related: ${relatedEntity};
`;
    }

    schema[fileName] = `${imports}
@Entity()
export class ${entityName} {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value?: number;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
${relationsFields}}
`;
  }

  return schema;
};