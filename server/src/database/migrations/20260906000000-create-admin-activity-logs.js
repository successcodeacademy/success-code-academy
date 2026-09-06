'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = new Set((await queryInterface.showAllTables()).map((table) => (
      typeof table === 'string' ? table : table.tableName || String(table)
    )));
    const columns = {
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
    };

    if (!tables.has('admin_activity_logs')) {
      await queryInterface.createTable('admin_activity_logs', columns);
    } else {
      // Development sync can create this table before SequelizeMeta records
      // the migration. Add only genuinely missing columns in that case.
      const existingColumns = await queryInterface.describeTable('admin_activity_logs');
      for (const [name, definition] of Object.entries(columns)) {
        if (!existingColumns[name]) await queryInterface.addColumn('admin_activity_logs', name, definition);
      }
    }

    const indexes = await queryInterface.showIndex('admin_activity_logs');
    const requiredIndexes = [
      ['createdAt'],
      ['adminId'],
      ['resource'],
      ['action'],
    ];
    for (const fields of requiredIndexes) {
      const exists = indexes.some((index) => {
        const indexFields = (index.fields || []).map((field) => field.attribute || field.name);
        return indexFields.length === fields.length && indexFields.every((field, position) => field === fields[position]);
      });
      if (!exists) await queryInterface.addIndex('admin_activity_logs', fields);
    }
  },

  async down(queryInterface) {
    const tables = new Set((await queryInterface.showAllTables()).map((table) => (
      typeof table === 'string' ? table : table.tableName || String(table)
    )));
    if (tables.has('admin_activity_logs')) await queryInterface.dropTable('admin_activity_logs');
  },
};
