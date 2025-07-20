import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);
const dbName = 'cineglow';

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');
  const existing = await users.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { email, name, password: hashed };
  await users.insertOne(user);
  const token = jwt.sign({ email, name }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return NextResponse.json({ token, user: { email, name } });
} 