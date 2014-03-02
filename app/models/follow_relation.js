module.exports = function(sequelize, DataTypes) {
    var Follow_relation = sequelize.define('Follow_relation', {
        follower: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        followee: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        instanceMethods: {
            
        }
    });

    return Follow_relation;
};
