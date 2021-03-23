import { createContext, useContext } from 'react';
import { makeStyles as muiStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';

type Theme = {};

const T = createContext<Theme>({});
T.displayName = 'Theme';

export const ThemeProvider = T.Provider;

export function useTheme(): Theme {
  return useContext(T);
}

// tslint:disable:no-any
export function makeStyles<
  Props extends {} = {},
  ClassKey extends string = string
>(
  styles: Styles<Theme, Props, ClassKey>
): (props?: Props) => ClassNameMap<ClassKey>;

export function makeStyles(arg: any) {
  return (props: any) => {
    if (typeof arg !== 'function') {
      return muiStyles(arg)(props);
    }

    const theme = useContext(T);
    return muiStyles(arg(theme))(props);
  };
}
// tslint:enable:no-any
