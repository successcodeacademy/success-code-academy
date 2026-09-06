import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface AdminActivityLogAttributes {
  id: number;
  adminId: number;
  adminEmail: string;
  adminRole: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  method: string;
  route: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminActivityLogCreationAttributes extends Optional<
  AdminActivityLogAttributes,
  'id' | 'resourceId' | 'metadata' | 'before' | 'after' | 'createdAt' | 'updatedAt'
> {}

export class AdminActivityLog extends Model<
  AdminActivityLogAttributes,
  AdminActivityLogCreationAttributes
> implements AdminActivityLogAttributes {
  declare id: number;
  declare adminId: number;
  declare adminEmail: string;
  declare adminRole: string;
  declare action: string;
  declare resource: string;
  declare resourceId: string | null;
  declare method: string;
  declare route: string;
  declare summary: string;
  declare metadata: Record<string, unknown> | null;
  declare before: Record<string, unknown> | null;
  declare after: Record<string, unknown> | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initAdminActivityLog(sequelize: Sequelize): void {
  AdminActivityLog.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      adminId: { type: DataTypes.INTEGER, allowNull: false },
      adminEmail: { type: DataTypes.STRING(255), allowNull: false },
      adminRole: { type: DataTypes.STRING(40), allowNull: false },
      action: { type: DataTypes.STRING(40), allowNull: false },
      resource: { type: DataTypes.STRING(80), allowNull: false },
      resourceId: { type: DataTypes.STRING(80), allowNull: true },
      method: { type: DataTypes.STRING(10), allowNull: false },
      route: { type: DataTypes.STRING(255), allowNull: false },
      summary: { type: DataTypes.STRING(500), allowNull: false },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      before: { type: DataTypes.JSONB, allowNull: true },
      after: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      sequelize,
      tableName: 'admin_activity_logs',
      timestamps: true,
      indexes: [
        { fields: ['createdAt'] },
        { fields: ['adminId'] },
        { fields: ['resource'] },
        { fields: ['action'] },
      ],
    },
  );
}

export default AdminActivityLog;
