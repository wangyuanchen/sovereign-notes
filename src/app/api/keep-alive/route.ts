import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 简单的查询以保持数据库活跃
    // Execute a simple query explicitly to ensure connection is active
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep-alive check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database check failed'
    }, { status: 500 });
  }
}
