import { jsonParse } from 'n8n-workflow';
import { ValueTransformer } from 'typeorm';
import config from '../../../config';

export const idStringifier = {
	from: (value: number): string | number => (typeof value === 'number' ? value.toString() : value),
	to: (value: string): number | string => (typeof value === 'string' ? Number(value) : value),
};

export const lowerCaser = {
	from: (value: string): string => value,
	to: (value: string): string => (typeof value === 'string' ? value.toLowerCase() : value),
};

/**
 * Unmarshal JSON as JS object.
 */
export const objectRetriever: ValueTransformer = {
	to: (value: object): object => value,
	from: (value: string | object): object => (typeof value === 'string' ? jsonParse(value) : value),
};

/**
 * Transformer for sqlite JSON columns to mimic JSON-as-object behavior
 * from Postgres and MySQL.
 */
const jsonColumn: ValueTransformer = {
	to: (value: object): string | object =>
		config.getEnv('database.type') === 'sqlite' ? JSON.stringify(value) : value,
	from: (value: string | object): object => (typeof value === 'string' ? jsonParse(value) : value),
};

export const sqlite = { jsonColumn };
