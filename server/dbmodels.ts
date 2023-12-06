import { Sequelize, DataTypes } from 'sequelize'

const HOST = 'localhost'

const db = new Sequelize({
  host: HOST,
  port: 5432,
  dialect: 'postgres',
  username: 'postgres',
  database: 'whspr',
  password: 'ok'
})

export const User = db.define('User', {
  username: {
    type: DataTypes.STRING
  },
  profileImgUrl: {
    type: DataTypes.STRING
  }
})

export const MagicConch = db.define('MagicConch', {
  sendingUserId: {
    type: DataTypes.BIGINT
  },
  receivingUserId: {
    type: DataTypes.BIGINT
  },
  title: {
    type: DataTypes.STRING
  },
  url: {
    type: DataTypes.STRING
  },
  soundURL: {
    type: DataTypes.BIGINT
  }
})

export const Sound = db.define('Sound', {
  postId: {
    type: DataTypes.BIGINT
  },
  soundUrl: {
    type: DataTypes.STRING
  }
})

export const Post = db.define('Post', {
  userId: {
    type: DataTypes.BIGINT
  },
  title: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING
  },
  soundURL: {
    type: DataTypes.BIGINT
  }
})

export const Radio = db.define('Radio', {
  hostId: {
    type: DataTypes.BIGINT
  },
  listenerCount: {
    type: DataTypes.BIGINT
  },
  url: {
    type: DataTypes.STRING
  },
  title: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING
  }
})

export const Like = db.define('Like', {
  userId: {
    type: DataTypes.BIGINT
  },
  postId: {
    type: DataTypes.BIGINT
  }
})

export const UsersRadio = db.define('UsersRadio', {
  socketId: {
    type: DataTypes.BIGINT
  },
  userId: {
    type: DataTypes.BIGINT
  },
  radiosId: {
    type: DataTypes.BIGINT
  }
})

export const Follower = db.define('Follower', {
  userId: {
    type: DataTypes.BIGINT
  },
  followingId: {
    type: DataTypes.BIGINT
  }
})

export const Stat = db.define('Stat', {
  userId: {
    type: DataTypes.BIGINT
  },
  postId: {
    type: DataTypes.BIGINT
  },
  type: {
    type: DataTypes.STRING
  }
})
// defines table relations
MagicConch.belongsTo(User, { foreignKey: 'sendingUserId', as: 'sendingUser' })
MagicConch.belongsTo(User, { foreignKey: 'receivingUserId', as: 'receivingUser' })
MagicConch.belongsTo(Sound, { foreignKey: 'soundURL' })

Like.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' })

UsersRadio.belongsTo(User, { foreignKey: 'userId', as: 'user' })
UsersRadio.belongsTo(Radio, { foreignKey: 'radiosId', as: 'radio' })

Radio.belongsTo(User, { foreignKey: 'hostId', as: 'host' })

Post.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Post.belongsTo(Sound, { foreignKey: 'postId' })

Stat.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Stat.belongsTo(Post, { foreignKey: 'postId', as: 'post' })

Follower.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Follower.belongsTo(User, { foreignKey: 'followingId', as: 'followingUser' })

// Sound.belongsTo(Post, { foreignKey: 'postId', as: 'post' })

db.authenticate()
  .then(() => {
    console.log(`Successfully connected to the database on ${HOST}`)
  })
  .catch((error: any) => {
    console.error('Error connecting to the database:', error.message)
  })

// export script funcs that ref db:

export const authenticateDatabase = async (): Promise<void> => {
  try {
    await db.authenticate()
    console.log(`Successfully connected to the database on ${HOST}`)
  } catch (error) {
    console.error('Error connecting to the database:', error)
  }
}

export const syncDatabase = async (): Promise<void> => {
  try {
    await db.sync({ force: true })
    console.log('Database synced!')
  } catch (error) {
    console.error('Error syncing database:', error)
  }
}

export const dropDatabase = async (): Promise<void> => {
  try {
    await db.query('DROP DATABASE IF EXISTS "whspr"')
    console.log('Database dropped')
  } catch (error) {
    console.error('Error dropping the database:', error)
  }
}

export const createDatabase = async (): Promise<void> => {
  try {
    await db.query('CREATE DATABASE "whspr"')
    console.log('Database created')
  } catch (error) {
    console.error('Error creating the database:', error)
  }
}
