import { PhysicalCopyCondition } from 'src/common/enums/physical-copy-condition.enum';

const CONDITION_RANK: Record<PhysicalCopyCondition, number> = {
  [PhysicalCopyCondition.NEW]: 0,
  [PhysicalCopyCondition.GOOD]: 1,
  [PhysicalCopyCondition.WORN]: 2,
  [PhysicalCopyCondition.DAMAGED]: 3,
};

export function physicalConditionRank(
  condition: PhysicalCopyCondition | null | undefined,
): number {
  if (condition == null) return CONDITION_RANK[PhysicalCopyCondition.GOOD];
  return (
    CONDITION_RANK[condition] ?? CONDITION_RANK[PhysicalCopyCondition.GOOD]
  );
}

export function isPhysicalConditionWorseThanAtBorrow(
  received: PhysicalCopyCondition,
  atBorrow: PhysicalCopyCondition | null | undefined,
): boolean {
  return physicalConditionRank(received) > physicalConditionRank(atBorrow);
}
