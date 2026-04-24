import type { LucideIcon } from 'lucide-react';
import {
	Atom,
	BookOpen,
	Calculator,
	Code,
	FlaskConical,
	Globe,
	GraduationCap,
	Heart,
	Languages,
	Landmark,
	Leaf,
	Microscope,
	Music,
	Palette,
	PenTool,
} from 'lucide-react';

export function getCategoryIcon(name: string): LucideIcon {
	const normalizedName = name.toLowerCase();

	if (normalizedName.includes('toán') || normalizedName.includes('math'))
		return Calculator;
	if (
		normalizedName.includes('ngữ văn') ||
		normalizedName.includes('văn học') ||
		normalizedName.includes('literature')
	)
		return PenTool;
	if (
		normalizedName.includes('tiếng anh') ||
		normalizedName.includes('ngoại ngữ') ||
		normalizedName.includes('language')
	)
		return Languages;
	if (
		normalizedName.includes('kỹ năng') ||
		normalizedName.includes('soft skill')
	)
		return Heart;
	if (normalizedName.includes('truyện') || normalizedName.includes('tranh'))
		return Palette;
	if (
		normalizedName.includes('ôn thi') ||
		normalizedName.includes('đại học') ||
		normalizedName.includes('exam')
	)
		return GraduationCap;
	if (normalizedName.includes('hóa') || normalizedName.includes('chemistry'))
		return FlaskConical;
	if (normalizedName.includes('lý') || normalizedName.includes('physics'))
		return Atom;
	if (normalizedName.includes('sinh') || normalizedName.includes('biology'))
		return Microscope;
	if (normalizedName.includes('sử') || normalizedName.includes('history'))
		return Landmark;
	if (normalizedName.includes('địa') || normalizedName.includes('geography'))
		return Globe;
	if (normalizedName.includes('âm nhạc') || normalizedName.includes('music'))
		return Music;
	if (
		normalizedName.includes('lập trình') ||
		normalizedName.includes('code') ||
		normalizedName.includes('computer')
	)
		return Code;
	if (normalizedName.includes('sinh học') || normalizedName.includes('bio'))
		return Leaf;

	return BookOpen;
}
