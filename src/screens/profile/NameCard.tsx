import React, { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import { PrimaryButton } from '../../components/Buttons';
import Icon from '../../components/Icon';
import { Card } from '../../components/Layout';
import Tap from '../../components/Tap';
import TextField from '../../components/TextField';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { nameParts } from '../../utils/name';

/** Profil kartı: avatar, ad soyad, e-posta ve ad/soyad düzenleme. */
export default function NameCard() {
  const { t, profile, user, updateName } = useApp();
  const { firstName, lastName, full } = nameParts(profile ?? { name: user?.displayName ?? '' });
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');

  const start = () => {
    setFirst(firstName);
    setLast(lastName);
    setEditing(true);
  };
  const save = () => {
    if (first.trim().length < 1) return;
    updateName(first, last);
    setEditing(false);
  };

  return (
    <Card style={{ borderRadius: 22, padding: 18, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }}>
          <AppText weight="extrabold" size={26} color={colors.bg}>{(firstName[0] ?? '?').toUpperCase()}</AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText weight="extrabold" size={19}>{full}</AppText>
          <AppText size={13} color={colors.muted}>{profile?.email || user?.email}</AppText>
        </View>
        <Tap onPress={editing ? () => setEditing(false) : start} accessibilityLabel={t('profile.editName')} pressedBg={colors.card2}
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="edit" size={18} color={colors.lime} />
        </Tap>
      </View>
      {editing && (
        <View style={{ gap: 10 }}>
          <TextField height={46} placeholder={t('auth.firstName')} value={first} onChangeText={setFirst} autoCapitalize="words" />
          <TextField height={46} placeholder={t('auth.lastName')} value={last} onChangeText={setLast} autoCapitalize="words" />
          <PrimaryButton label={t('profile.save')} height={46} fontSize={15} onPress={save} />
        </View>
      )}
    </Card>
  );
}
