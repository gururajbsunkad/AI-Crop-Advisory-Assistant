import { useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Redirect, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import { AdvisoriesPage, AdvisoryDetailPage, DashboardPage, LandingPage, NewAdvisoryPage, ProfilePage, SignInPage, SignUpPage } from '@/pages/pages';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#1f6048',
    colorForeground: '#284036',
    colorMutedForeground: '#6f7c72',
    colorDanger: '#b84e42',
    colorBackground: '#f8f5ed',
    colorInput: '#f2eee3',
    colorInputForeground: '#284036',
    colorNeutral: '#d9d4c8',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '0.8rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#f8f5ed] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_20px_60px_rgba(40,64,54,.12)]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#284036] font-bold',
    headerSubtitle: 'text-[#6f7c72]',
    socialButtonsBlockButtonText: 'text-[#284036]',
    formFieldLabel: 'text-[#284036]',
    footerActionLink: 'text-[#1f6048] font-semibold',
    footerActionText: 'text-[#6f7c72]',
    dividerText: 'text-[#6f7c72]',
    identityPreviewEditButton: 'text-[#1f6048]',
    formFieldSuccessText: 'text-[#1f6048]',
    alertText: 'text-[#b84e42]',
    logoBox: 'rounded-xl',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border-[#d9d4c8] bg-[#f2eee3]',
    formButtonPrimary: 'bg-[#1f6048] hover:bg-[#174b37] text-[#f8f5ed]',
    formFieldInput: 'bg-[#f2eee3] border-[#d9d4c8] text-[#284036]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#d9d4c8]',
    alert: 'bg-[#b84e42]/10 border-[#b84e42]/20',
    otpCodeFieldInput: 'bg-[#f2eee3] border-[#d9d4c8] text-[#284036]',
    formFieldRow: 'gap-2',
    main: 'bg-transparent',
  },
};

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previous.current !== undefined && previous.current !== userId) client.clear();
      previous.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function Protected({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-[100dvh] bg-background" />;
  return isSignedIn ? <Redirect to="/dashboard" /> : <LandingPage />;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AppRoutes() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={HomeRedirect} />
    <Route path="/sign-in/*?" component={SignInPage} />
    <Route path="/sign-up/*?" component={SignUpPage} />
    <Route path="/dashboard"><Protected><DashboardPage /></Protected></Route>
    <Route path="/advisory/new"><Protected><NewAdvisoryPage /></Protected></Route>
    <Route path="/advisory/:id"><Protected><AdvisoryDetailPage /></Protected></Route>
    <Route path="/advisories"><Protected><AdvisoriesPage /></Protected></Route>
    <Route path="/profile"><Protected><ProfilePage /></Protected></Route>
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary>;
}

function ClerkApp() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Your field desk is ready.' } }, signUp: { start: { title: 'Start your field desk', subtitle: 'A calm place for better crop decisions.' } } }} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })}>
    <QueryClientProvider client={queryClient}><ClerkCacheInvalidator /><AppRoutes /></QueryClientProvider>
  </ClerkProvider>;
}

export default function App() {
  return <WouterRouter base={basePath}><ClerkApp /></WouterRouter>;
}