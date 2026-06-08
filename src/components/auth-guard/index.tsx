import type { ComponentType } from "react";
import { ActivityIndicator } from "react-native";
import type { Session } from "@supabase/supabase-js";

import { AuthGate } from "@/components/auth-gate";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

import { styles } from "./auth-guard.styles";

type AuthLoadingProps = {
  authLoading: boolean;
};

type AuthGateProps = {
  session: Session | null;
};

type AuthGuardProps = AuthLoadingProps & AuthGateProps;

export function withAuthLoading<Props extends AuthLoadingProps>(
  WrappedComponent: ComponentType<Props>,
) {
  return function WithAuthLoading(props: Props) {
    const theme = useTheme();

    if (props.authLoading) {
      return (
        <ThemedView style={styles.centeredScreen}>
          <ActivityIndicator color={theme.text} />
        </ThemedView>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export function withAuthGate<Props extends AuthGateProps>(WrappedComponent: ComponentType<Props>) {
  return function WithAuthGate(props: Props) {
    if (!props.session) {
      return <AuthGate />;
    }

    return <WrappedComponent {...props} />;
  };
}

export function withAuthGuard<Props extends AuthGuardProps>(WrappedComponent: ComponentType<Props>) {
  return withAuthLoading(withAuthGate(WrappedComponent));
}
