'use strict';
const {
  Model
} = require('sequelize');

interface LikeAttributes{
  userId: number;
  postId: number;
}

module.exports = (sequelize, DataTypes) => {
  class Likes extends Model<LikeAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    userId!: number;
    postId!: number;

    static associate(models) {
      // define association here
      Like.belongsTo(models.User, { foreignKey: 'userId'})
      Like.belongsTo(models.Post, { foreignKey: 'postId'})
    }
  }
  Likes.init({
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Likes',
  });
  return Likes;
};