'use strict';
const {
  Model
} = require('sequelize');

interface RadioAttributes {
  hostId: number;
  listenerCount: number;
  url: string;
  title: string;
  category: string;
}

module.exports = (sequelize, DataTypes) => {
  class Radio extends Model<RadioAttributes> {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    hostId!: number;
    listenerCount!: number;
    url!: string;
    title!: string;
    category!: string;
    static associate(models) {
      // define association here
      Radio.belongsTo(models.User, { foreignKey: 'hostId'})
    }
  }
  Radio.init({
    hostId: DataTypes.INTEGER,
    listenerCount: DataTypes.INTEGER,
    url: DataTypes.STRING,
    title: DataTypes.STRING,
    category: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Radio',
  });
  return Radio;
};