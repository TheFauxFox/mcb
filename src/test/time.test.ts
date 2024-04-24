import { test, expect } from '@jest/globals';
import { getDateStamp, getTimeStamp, mcTimeToHRT } from '../lib/time';

test('Time conversion is correct', () => {
	expect(mcTimeToHRT(0)).toBe('06:00');
	expect(mcTimeToHRT(6000)).toBe('12:00');
	expect(mcTimeToHRT(9512)).toBe('15:30');
	expect(mcTimeToHRT(12000)).toBe('18:00');
	expect(mcTimeToHRT(18000)).toBe('00:00');
	expect(mcTimeToHRT(24000)).toBe('06:00');
});

test('Timestamp format is correct', () => {
	expect(getTimeStamp()).toMatch(/^\d{2}:\d{2}:\d{2}$/);
});

test('Datestamp format is correct', () => {
	expect(getDateStamp()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});
