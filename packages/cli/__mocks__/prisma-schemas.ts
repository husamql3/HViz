// Mock Prisma schemas for testing

export const simplePrismaSchema = `
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  authorId  Int
  author    User    @relation(fields: [authorId], references: [id])
}
`;

export const mediumPrismaSchema = `
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  posts     Post[]
  profile   Profile?
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  avatar String?
  userId Int     @unique
  user   User    @relation(fields: [userId], references: [id])
}

model Post {
  id         Int       @id @default(autoincrement())
  title      String
  content    String?
  published  Boolean   @default(false)
  authorId   Int
  author     User      @relation(fields: [authorId], references: [id])
  comments   Comment[]
  categories Category[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  postId    Int
  post      Post     @relation(fields: [postId], references: [id])
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
`;

export const complexPrismaSchema = `
model User {
  id            Int           @id @default(autoincrement())
  email         String        @unique
  username      String        @unique
  password      String
  firstName     String?
  lastName      String?
  avatar        String?
  bio           String?
  isVerified    Boolean       @default(false)
  role          Role          @default(USER)
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  followers     Follow[]      @relation("follower")
  following     Follow[]      @relation("following")
  notifications Notification[]
  messages      Message[]
  profile       Profile?
  settings      Settings?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum Role {
  USER
  MODERATOR
  ADMIN
}

model Profile {
  id            Int      @id @default(autoincrement())
  userId        Int      @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dateOfBirth   DateTime?
  location      String?
  website       String?
  company       String?
  phoneNumber   String?
  isPrivate     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Settings {
  id                    Int      @id @default(autoincrement())
  userId                Int      @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailNotifications    Boolean  @default(true)
  pushNotifications     Boolean  @default(true)
  theme                 String   @default("light")
  language              String   @default("en")
  twoFactorEnabled      Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Post {
  id          Int        @id @default(autoincrement())
  title       String
  content     String
  slug        String     @unique
  published   Boolean    @default(false)
  viewCount   Int        @default(0)
  authorId    Int
  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  likes       Like[]
  tags        Tag[]
  categories  Category[]
  media       Media[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  publishedAt DateTime?
}

model Comment {
  id        Int       @id @default(autoincrement())
  content   String
  postId    Int
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  parentId  Int?
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  likes     Like[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Like {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId    Int?
  post      Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  commentId Int?
  comment   Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, postId])
  @@unique([userId, commentId])
}

model Follow {
  id          Int      @id @default(autoincrement())
  followerId  Int
  follower    User     @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  followingId Int
  following   User     @relation("following", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
}

model Tag {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

model Category {
  id          Int        @id @default(autoincrement())
  name        String     @unique
  slug        String     @unique
  description String?
  posts       Post[]
  createdAt   DateTime   @default(now())
}

model Media {
  id        Int      @id @default(autoincrement())
  url       String
  type      String
  size      Int
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Notification {
  id        Int      @id @default(autoincrement())
  type      String
  content   String
  read      Boolean  @default(false)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Message {
  id         Int      @id @default(autoincrement())
  content    String
  senderId   Int
  sender     User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  receiverId Int
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())
}
`;

// Stress test: Generate a large schema programmatically
export const generateLargePrismaSchema = (numTables: number): string => {
	const models: string[] = [];

	// Create main entities
	for (let i = 0; i < numTables; i++) {
		const modelName = `Entity${i}`;
		const relatedModel = i > 0 ? `Entity${i - 1}` : null;

		let model = `
model ${modelName} {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  status      String   @default("active")
  value       Float?
  count       Int      @default(0)
  isActive    Boolean  @default(true)
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
`;

		// Add relation to previous entity (chain)
		if (relatedModel) {
			model += `  parentId    Int?\n`;
			model += `  parent      ${relatedModel}?  @relation("${modelName}To${relatedModel}", fields: [parentId], references: [id])\n`;
			model += `  children    ${modelName}[]  @relation("${modelName}To${relatedModel}")\n`;
		}

		// Add some random relations to other entities
		if (i > 2 && i % 3 === 0) {
			const targetEntity = `Entity${Math.floor(i / 2)}`;
			model += `  relatedId   Int?\n`;
			model += `  related     ${targetEntity}? @relation(fields: [relatedId], references: [id])\n`;
		}

		model += `}\n`;
		models.push(model);
	}

	return models.join("\n");
};

export const emptyPrismaSchema = ``;

export const singleTablePrismaSchema = `
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`;

export const selfReferencingPrismaSchema = `
model Category {
  id          Int        @id @default(autoincrement())
  name        String
  parentId    Int?
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
}
`;
