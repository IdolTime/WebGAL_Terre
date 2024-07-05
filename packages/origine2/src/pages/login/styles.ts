import {
  makeStyles,
  shorthands,
  tokens,
  typographyStyles
} from "@fluentui/react-components";

export const authScreenStyles = makeStyles({
  root: {
    ...shorthands.border(
      tokens.strokeWidthThick,
      "solid",
      tokens.colorNeutralBackground3
    ),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.overflow("visible"),
    ...shorthands.padding("40px"),
    boxSizing: "border-box",
    boxShadow: tokens.shadow16,
    ...shorthands.margin("50px"),
    display: "flex",
    flexDirection: "column",
    background: '#eae'
  },
  codeRow: {
    display: "flex",
    alignItems: "flex-end",
    columnGap: "20px",
    // justifyContent: "space-between",
  },
  inputList: {
    display: "contents",
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center"
  },
  input: {
    ...shorthands.margin("10px", 0, 0, 0)
  },
  button: {
    ...shorthands.margin("10px", 0, 0, 0)
  },
  termsText: {
    alignItems: "center",
    justifyItems: "center",
    justifyContent: "center",
    textAlign: "center",
    ...typographyStyles.body2,
    ...shorthands.margin("10px", 0, 0, 0)
  },
  copyRightFont: {
    fontSize: "14px",
    fontWeight: "bold"
  }
});
