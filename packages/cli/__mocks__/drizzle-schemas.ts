// Mock Drizzle schemas for testing

export const simpleDrizzlePostgresSchema = {
	users: {
		id: { type: "serial", primaryKey: true },
		email: { type: "varchar(255)", notNull: true, unique: true },
		name: { type: "varchar(255)" },
	},
	posts: {
		id: { type: "serial", primaryKey: true },
		title: { type: "varchar(255)", notNull: true },
		content: { type: "text" },
		authorId: { type: "integer", notNull: true },
	},
};

export const simpleDrizzleMysqlSchema = {
	users: {
		id: { type: "int", primaryKey: true, autoIncrement: true },
		email: { type: "varchar(255)", notNull: true, unique: true },
		name: { type: "varchar(255)" },
	},
	posts: {
		id: { type: "int", primaryKey: true, autoIncrement: true },
		title: { type: "varchar(255)", notNull: true },
		content: { type: "text" },
		authorId: { type: "int", notNull: true },
	},
};

export const simpleDrizzleSqliteSchema = {
	users: {
		id: { type: "integer", primaryKey: true },
		email: { type: "text", notNull: true, unique: true },
		name: { type: "text" },
	},
	posts: {
		id: { type: "integer", primaryKey: true },
		title: { type: "text", notNull: true },
		content: { type: "text" },
		authorId: { type: "integer", notNull: true },
	},
};

// Mock DBML output for Drizzle
export const simpleDrizzleDbml = `
Table users {
  id serial [pk]
  email varchar(255) [not null, unique]
  name varchar(255)
}

Table posts {
  id serial [pk]
  title varchar(255) [not null]
  content text
  authorId integer [not null]
}

Ref: posts.authorId > users.id
`;

export const mediumDrizzleDbml = `
Table users {
  id serial [pk]
  email varchar(255) [not null, unique]
  name varchar(255)
  createdAt timestamp [not null, default: \`now()\`]
}

Table profiles {
  id serial [pk]
  bio text
  avatar varchar(255)
  userId integer [not null, unique]
}

Table posts {
  id serial [pk]
  title varchar(255) [not null]
  content text
  published boolean [not null, default: false]
  authorId integer [not null]
  createdAt timestamp [not null, default: \`now()\`]
}

Table comments {
  id serial [pk]
  content text [not null]
  postId integer [not null]
  authorId integer [not null]
  createdAt timestamp [not null, default: \`now()\`]
}

Table categories {
  id serial [pk]
  name varchar(255) [not null, unique]
}

Table post_categories {
  postId integer [not null]
  categoryId integer [not null]
  
  indexes {
    (postId, categoryId) [pk]
  }
}

Ref: profiles.userId - users.id
Ref: posts.authorId > users.id
Ref: comments.postId > posts.id
Ref: comments.authorId > users.id
Ref: post_categories.postId > posts.id
Ref: post_categories.categoryId > categories.id
`;

export const complexDrizzleDbml = `
Table users {
  id serial [pk]
  email varchar(255) [not null, unique]
  username varchar(100) [not null, unique]
  password varchar(255) [not null]
  firstName varchar(100)
  lastName varchar(100)
  avatar varchar(255)
  bio text
  isVerified boolean [not null, default: false]
  role varchar(50) [not null, default: 'USER']
  createdAt timestamp [not null, default: \`now()\`]
  updatedAt timestamp [not null, default: \`now()\`]
}

Table profiles {
  id serial [pk]
  userId integer [not null, unique]
  dateOfBirth date
  location varchar(255)
  website varchar(255)
  company varchar(255)
  phoneNumber varchar(50)
  isPrivate boolean [not null, default: false]
  createdAt timestamp [not null, default: \`now()\`]
}

Table settings {
  id serial [pk]
  userId integer [not null, unique]
  emailNotifications boolean [not null, default: true]
  pushNotifications boolean [not null, default: true]
  theme varchar(50) [not null, default: 'light']
  language varchar(10) [not null, default: 'en']
  twoFactorEnabled boolean [not null, default: false]
  createdAt timestamp [not null, default: \`now()\`]
}

Table posts {
  id serial [pk]
  title varchar(255) [not null]
  content text [not null]
  slug varchar(255) [not null, unique]
  published boolean [not null, default: false]
  viewCount integer [not null, default: 0]
  authorId integer [not null]
  createdAt timestamp [not null, default: \`now()\`]
  updatedAt timestamp [not null, default: \`now()\`]
  publishedAt timestamp
}

Table comments {
  id serial [pk]
  content text [not null]
  postId integer [not null]
  authorId integer [not null]
  parentId integer
  createdAt timestamp [not null, default: \`now()\`]
}

Table likes {
  id serial [pk]
  userId integer [not null]
  postId integer
  commentId integer
  createdAt timestamp [not null, default: \`now()\`]
}

Table follows {
  id serial [pk]
  followerId integer [not null]
  followingId integer [not null]
  createdAt timestamp [not null, default: \`now()\`]
}

Table tags {
  id serial [pk]
  name varchar(100) [not null, unique]
  slug varchar(100) [not null, unique]
  createdAt timestamp [not null, default: \`now()\`]
}

Table categories {
  id serial [pk]
  name varchar(100) [not null, unique]
  slug varchar(100) [not null, unique]
  description text
  createdAt timestamp [not null, default: \`now()\`]
}

Table post_tags {
  postId integer [not null]
  tagId integer [not null]
  
  indexes {
    (postId, tagId) [pk]
  }
}

Table post_categories {
  postId integer [not null]
  categoryId integer [not null]
  
  indexes {
    (postId, categoryId) [pk]
  }
}

Table media {
  id serial [pk]
  url varchar(255) [not null]
  type varchar(50) [not null]
  size integer [not null]
  postId integer [not null]
  createdAt timestamp [not null, default: \`now()\`]
}

Table notifications {
  id serial [pk]
  type varchar(50) [not null]
  content text [not null]
  read boolean [not null, default: false]
  userId integer [not null]
  createdAt timestamp [not null, default: \`now()\`]
}

Table messages {
  id serial [pk]
  content text [not null]
  senderId integer [not null]
  receiverId integer [not null]
  read boolean [not null, default: false]
  createdAt timestamp [not null, default: \`now()\`]
}

Ref: profiles.userId - users.id
Ref: settings.userId - users.id
Ref: posts.authorId > users.id
Ref: comments.postId > posts.id
Ref: comments.authorId > users.id
Ref: comments.parentId > comments.id
Ref: likes.userId > users.id
Ref: likes.postId > posts.id
Ref: likes.commentId > comments.id
Ref: follows.followerId > users.id
Ref: follows.followingId > users.id
Ref: post_tags.postId > posts.id
Ref: post_tags.tagId > tags.id
Ref: post_categories.postId > posts.id
Ref: post_categories.categoryId > categories.id
Ref: media.postId > posts.id
Ref: notifications.userId > users.id
Ref: messages.senderId > users.id
`;

// Generate large DBML for stress testing
export const generateLargeDrizzleDbml = (numTables: number): string => {
	const tables: string[] = [];
	const refs: string[] = [];

	for (let i = 0; i < numTables; i++) {
		const tableName = `entity_${i}`;
		let table = `
Table ${tableName} {
  id serial [pk]
  name varchar(255) [not null]
  description text
  status varchar(50) [not null, default: 'active']
  value decimal(10,2)
  count integer [not null, default: 0]
  isActive boolean [not null, default: true]
  createdAt timestamp [not null, default: \`now()\`]
  updatedAt timestamp [not null, default: \`now()\`]
`;

		// Add foreign key to previous table
		if (i > 0) {
			table += `  parentId integer\n`;
			refs.push(`Ref: ${tableName}.parentId > entity_${i - 1}.id`);
		}

		// Add cross references
		if (i > 2 && i % 3 === 0) {
			table += `  relatedId integer\n`;
			refs.push(`Ref: ${tableName}.relatedId > entity_${Math.floor(i / 2)}.id`);
		}

		table += `}\n`;
		tables.push(table);
	}

	return `${tables.join("\n")}\n${refs.join("\n")}`;
};
