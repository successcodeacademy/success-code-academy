'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = new Set((await queryInterface.showAllTables()).map((table) => (
      typeof table === 'string' ? table : table.tableName || String(table)
    )));
    if (!tables.has('admin_activity_logs')) return;

    const columns = await queryInterface.describeTable('admin_activity_logs');
    if (!columns.before) await queryInterface.addColumn('admin_activity_logs', 'before', { type: Sequelize.JSONB, allowNull: true });
    if (!columns.after) await queryInterface.addColumn('admin_activity_logs', 'after', { type: Sequelize.JSONB, allowNull: true });
  },

  async down(queryInterface) {
    const tables = new Set((await queryInterface.showAllTables()).map((table) => (
      typeof table === 'string' ? table : table.tableName || String(table)
    )));
    if (!tables.has('admin_activity_logs')) return;
    const columns = await queryInterface.describeTable('admin_activity_logs');
    if (columns.after) await queryInterface.removeColumn('admin_activity_logs', 'after');
    if (columns.before) await queryInterface.removeColumn('admin_activity_logs', 'before');
  },
};
