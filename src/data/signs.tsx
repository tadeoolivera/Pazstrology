

import CancerIcon from 'zodiacfonts/icons/signs/cancer.svg?react';
import LeoIcon from 'zodiacfonts/icons/signs/leo.svg?react';
import VirgoIcon from 'zodiacfonts/icons/signs/virgo.svg?react';
import LibraIcon from 'zodiacfonts/icons/signs/libra.svg?react';
import ScorpioIcon from 'zodiacfonts/icons/signs/scorpio.svg?react';
import SagittariusIcon from 'zodiacfonts/icons/signs/sagittarius.svg?react';
import CapricornIcon from 'zodiacfonts/icons/signs/capricorn.svg?react';
import AquariusIcon from 'zodiacfonts/icons/signs/aquarius.svg?react';
import PiscesIcon from 'zodiacfonts/icons/signs/pisces.svg?react';
import AriesIcon from 'zodiacfonts/icons/signs/aries.svg?react';
import TaurusIcon from 'zodiacfonts/icons/signs/taurus.svg?react';
import GeminiIcon from 'zodiacfonts/icons/signs/gemini.svg?react';

export const ELEMENT_COLORS = {
  fire: '#FC1732',
  earth: '#8D762D',
  air: '#377F83',
  water: '#1718D9'
};

export const SIGNS = {
  cancer: <CancerIcon color={ELEMENT_COLORS.water} />,
  leo: <LeoIcon color={ELEMENT_COLORS.fire} />,
  virgo: <VirgoIcon color={ELEMENT_COLORS.earth} />,
  libra: <LibraIcon color={ELEMENT_COLORS.air} />,
  scorpio: <ScorpioIcon color={ELEMENT_COLORS.water} />,
  sagittarius: <SagittariusIcon color={ELEMENT_COLORS.fire} />,
  capricorn: <CapricornIcon color={ELEMENT_COLORS.earth} />,
  aquarius: <AquariusIcon color={ELEMENT_COLORS.air} />,
  pisces: <PiscesIcon color={ELEMENT_COLORS.water} />,
  aries: <AriesIcon color={ELEMENT_COLORS.fire} />,
  taurus: <TaurusIcon color={ELEMENT_COLORS.earth} />,
  gemini: <GeminiIcon color={ELEMENT_COLORS.air} />
};

export const SIGN_ORDER = ['sagittarius', 'scorpio', 'libra', 'virgo', 'leo', 'cancer', 'gemini', 'taurus', 'aries', 'pisces', 'aquarius', 'capricorn'] as const;