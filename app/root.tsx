import { AlertCircleIcon, ArrowLeftIcon, CheckIcon } from "lucide-react";
import {
  data,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation
} from "react-router";
import type { Route } from "./+types/root";
import appStylesHref from "./app.css?url";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { commitSession, getSession } from "./lib/auth.server";

export function meta() {
  return [{ title: "Guestbook" }] satisfies ReturnType<Route.MetaFunction>;
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return data(
    {
      error: session.get("error"),
      success: session.get("success")
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    }
  );
}

export default function App({
  loaderData: { error, success }
}: Route.ComponentProps) {
  const location = useLocation();
  return (
    <main className="p-5 flex flex-col items-start gap-5 max-w-2xl mb-40 mx-4 mt-8 lg:mx-auto">
      {location.pathname !== "/" && (
        <div>
          <Link to="/" className="inline-flex underline items-center gap-1">
            <ArrowLeftIcon size={15} />
            <span>Back home</span>
          </Link>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error} </AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="success">
          <CheckIcon className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Outlet />
    </main>
  );
}

export function HydrateFallback() {
  return (
    <div id="loading-splash">
      <div id="loading-splash-spinner" />
      <p>Loading, please wait...</p>
    </div>
  );
}

// The Layout component is a special export for the root route.
// It acts as your document's "app shell" for all route components, HydrateFallback, and ErrorBoundary
// For more information, see https://reactrouter.com/explanation/special-files#layout-export
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href={appStylesHref} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// The top most error boundary for the app, rendered when your app throws an error
// For more information, see https://reactrouter.com/start/framework/route-module#errorboundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="error-page">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
