import { AttributedString } from '../layout';
import Font from '../font';
import { embedEmojis } from './emoji';
import capitalize from './capitalize';
import { ignoreChars } from './ignorableChars';

const PREPROCESSORS = [ignoreChars, embedEmojis];

const transformText = (text, transformation) => {
  switch (transformation) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return capitalize(text);
    default:
      return text;
  }
};

export const getFragments = instance => {
  let fragments = [];
  const {
    color = 'black',
    fontFamily = 'Helvetica',
    fontSize = 18,
    textAlign = 'left',
    position,
    top,
    bottom,
    lineHeight,
    textDecoration,
    textDecorationColor,
    textDecorationStyle,
    textTransform,
    letterSpacing,
  } = instance.getComputedStyles();

  instance.children.forEach(child => {
    if (child.value !== null && child.value !== undefined) {
      const obj = Font.getFont(fontFamily);
      const font = obj ? obj.data : fontFamily;
      const string = transformText(child.value, textTransform);

      fragments.push({
        string,
        attributes: {
          font,
          color,
          fontSize,
          align: textAlign,
          link: instance.src,
          characterSpacing: letterSpacing,
          underlineStyle: textDecorationStyle,
          underline: textDecoration === 'underline',
          underlineColor: textDecorationColor || color,
          lineHeight: lineHeight ? lineHeight * fontSize : null,
          yOffset: position === 'relative' ? -top || bottom || 0 : null,
        },
      });
    } else {
      if (child) {
        fragments.push(...getFragments(child));
      }
    }
  });

  for (const preprocessor of PREPROCESSORS) {
    fragments = preprocessor(fragments);
  }

  return fragments;
};

export const getAttributedString = instance => {
  return AttributedString.fromFragments(getFragments(instance)).trim();
};
