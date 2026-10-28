export const AVATAR_IDS=['corvo','lontra','coala','leao'] as const;
export type AvatarId=typeof AVATAR_IDS[number];
export const avatarForSeat=(seat:number):AvatarId=>AVATAR_IDS[seat%AVATAR_IDS.length];
