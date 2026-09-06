'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admin_activity_logs', 'before', { type: Sequelize.JSONB, allowNull: true });
    await queryInterface.addColumn('admin_activity_logs', 'after', { type: Sequelize.JSONB, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('admin_activity_logs', 'after');
    await queryInterface.removeColumn('admin_activity_logs', 'before');
  },
};
