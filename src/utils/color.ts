import { colors } from '../theme/colors';

/** Fiyat artışı turuncu, düşüş yeşil, sabit gri. */
export const changeColor = (x: number) => (x > 0 ? colors.up : x < 0 ? colors.down : colors.muted);
