import { isPathWithRoot } from './isPathWithRoot';

describe('isPathWithRoot', () => {
    it('should return true', () => {
        expect(isPathWithRoot('/home/generated', './models/truck')).toBe(true);
    });
    it('should return false', () => {
        expect(isPathWithRoot('/home/generated', '../models/truck')).toBe(false);
    });
});
