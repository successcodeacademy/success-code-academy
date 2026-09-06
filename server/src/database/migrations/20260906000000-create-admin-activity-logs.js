'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_activity_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      adminId: { type: Sequelize.INTEGER, allowNull: false },
      adminEmail: { type: Sequelize.STRING(255), allowNull: false },
      adminRole: { type: Sequelize.STRING(40), allowNull: false },
      action: { type: Sequelize.STRING(40), allowNull: false },
      resource: { type: Sequelize.STRING(80), allowNull: false },
      resourceId: { type: Sequelize.STRING(80), allowNull: true },
      method: { type: Sequelize.STRING(10), allowNull: false },
      route: { type: Sequelize.STRING(255), allowNull: false },
      summary: { type: Sequelize.STRING(500), allowNull: false },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('admin_activity_logs', ['createdAt']);
    await queryInterface.addIndex('admin_activity_logs', ['adminId']);
    await queryInterface.addIndex('admin_activity_logs', ['resource']);
    await queryInterface.addIndex('admin_activity_logs', ['action']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admin_activity_logs');
  },
};
