import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme/colors';
import AppText from './AppText';
import Tap from './Tap';

/** Gösterilecek sayfa numaraları: az sayfada hepsi, çoksa baştaki/sondaki + seçili çevresi ("…" ile). */
function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

function Box({ children, on, disabled, onPress, label }: { children: string; on?: boolean; disabled?: boolean; onPress?: () => void; label: string }) {
  return (
    <Tap onPress={onPress} disabled={disabled || !onPress} accessibilityLabel={label} accessibilityState={{ selected: !!on, disabled }}
      style={{
        minWidth: 40, height: 40, paddingHorizontal: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        backgroundColor: on ? colors.lime : colors.card, opacity: disabled ? 0.4 : 1,
      }}>
      <AppText weight="bold" size={14} color={on ? colors.bg : colors.ink}>{children}</AppText>
    </Tap>
  );
}

/** Sayfalama: ‹ 1 2 3 › (tek sayfa varsa görünmez). */
export default function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
      <Box label="‹" disabled={page <= 1} onPress={() => onChange(page - 1)}>‹</Box>
      {pageList(page, total).map((p, i) =>
        p === '…' ? (
          <AppText key={`e${i}`} color={colors.muted} style={{ paddingHorizontal: 2 }}>…</AppText>
        ) : (
          <Box key={p} label={String(p)} on={p === page} onPress={() => onChange(p)}>{String(p)}</Box>
        ),
      )}
      <Box label="›" disabled={page >= total} onPress={() => onChange(page + 1)}>›</Box>
    </View>
  );
}
