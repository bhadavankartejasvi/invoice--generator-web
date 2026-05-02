import theme from "../../theme";

const AuthHeader = () => {
  return (
    <div className="mb-8 text-center">
      <h1
        style={theme.typography.h1}
        className="text-primary tracking-tight"
      >
        FinPrecision
      </h1>

      <p className="text-xs uppercase tracking-widest text-neutral mt-1">
        Enterprise Finance Solutions
      </p>
    </div>
  );
};

export default AuthHeader;