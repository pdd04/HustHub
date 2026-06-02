import { useEffect, useState } from "react";
import type { AuthUser, DocumentItem } from "@itss/shared";
import { AuthPage } from "./pages/AuthPage";
import { SearchPage } from "./pages/SearchPage";
import { DetailPage } from "./pages/DetailPage";
import { UploadPage } from "./pages/UploadPage";
import { ReviewerDashboardPage } from "./pages/ReviewerDashboardPage";
import { ExamModePage } from "./pages/ExamModePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { getCurrentUser, logoutUser } from "./lib/api";

type Route =
  | { name: "documents" }
  | { name: "document-detail"; documentId: string }
  | { name: "login" }
  | { name: "register" }
  | { name: "upload" }
  | { name: "review" }
  | { name: "exam-mode" }
  | { name: "admin" };

const authTokenStorageKey = "itss.accessToken";

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRoute());
  const [lastSearchPath, setLastSearchPath] = useState(() => getCurrentSearchPath());
  const [accessToken, setAccessToken] = useState<string | null>(() => window.localStorage.getItem(authTokenStorageKey));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(accessToken));

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = readRoute();

      if (nextRoute.name === "documents") {
        setLastSearchPath(getCurrentSearchPath());
      }

      setRoute(nextRoute);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setCurrentUser(null);
      setIsAuthLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsAuthLoading(true);

    getCurrentUser(accessToken, controller.signal)
      .then((payload) => setCurrentUser(payload.user))
      .catch(() => {
        if (controller.signal.aborted) return;
        window.localStorage.removeItem(authTokenStorageKey);
        setAccessToken(null);
        setCurrentUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsAuthLoading(false);
      });

    return () => controller.abort();
  }, [accessToken]);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setRoute(readRoute());
  };

  const openDocument = (document: DocumentItem) => {
    setLastSearchPath(getCurrentSearchPath());
    window.history.pushState(null, "", `/documents/${encodeURIComponent(document.id)}`);
    setRoute({ name: "document-detail", documentId: document.id });
  };

  const backToSearch = () => {
    window.history.pushState(null, "", lastSearchPath);
    setRoute(readRoute());
  };

  const authenticate = (user: AuthUser, token: string) => {
    window.localStorage.setItem(authTokenStorageKey, token);
    setAccessToken(token);
    setCurrentUser(user);
    navigate("/documents");
  };

  const logout = () => {
    if (accessToken) {
      void logoutUser(accessToken).catch(() => undefined);
    }

    window.localStorage.removeItem(authTokenStorageKey);
    setAccessToken(null);
    setCurrentUser(null);
    navigate("/documents");
  };

  const openUploadedDocument = (document: DocumentItem) => {
    window.history.pushState(null, "", `/documents/${encodeURIComponent(document.id)}`);
    setRoute({ name: "document-detail", documentId: document.id });
  };

  if (route.name === "document-detail") {
    return (
      <DetailPage
        documentId={route.documentId}
        currentUser={currentUser}
        accessToken={accessToken}
        onBack={backToSearch}
        onLogin={() => navigate("/login")}
      />
    );
  }

  if (route.name === "login" || route.name === "register") {
    return (
      <AuthPage
        mode={route.name}
        onAuthenticated={authenticate}
        onBack={() => navigate("/documents")}
        onSwitchMode={(mode) => navigate(`/${mode}`)}
      />
    );
  }

  if (route.name === "upload") {
    return (
      <UploadPage
        currentUser={currentUser}
        accessToken={accessToken}
        onBack={() => navigate("/documents")}
        onLogin={() => navigate("/login")}
        onUploaded={openUploadedDocument}
      />
    );
  }

  if (route.name === "review") {
    return (
      <ReviewerDashboardPage
        currentUser={currentUser}
        accessToken={accessToken}
        onBack={() => navigate("/documents")}
        onLogin={() => navigate("/login")}
        onSelectDocument={openUploadedDocument}
      />
    );
  }

  if (route.name === "exam-mode") {
    return (
      <ExamModePage
        currentUser={currentUser}
        accessToken={accessToken}
        onBack={() => navigate("/documents")}
        onLogin={() => navigate("/login")}
        onSelectDocument={openUploadedDocument}
      />
    );
  }

  if (route.name === "admin") {
    return (
      <AdminDashboardPage
        currentUser={currentUser}
        accessToken={accessToken}
        onBack={() => navigate("/documents")}
        onLogin={() => navigate("/login")}
      />
    );
  }

  return (
    <SearchPage
      currentUser={currentUser}
      isAuthLoading={isAuthLoading}
      onSelectDocument={openDocument}
      onNavigateLogin={() => navigate("/login")}
      onNavigateRegister={() => navigate("/register")}
      onNavigateUpload={() => navigate("/upload")}
      onNavigateReview={() => navigate("/review")}
      onNavigateExamMode={() => navigate("/exam-mode")}
      onNavigateAdmin={() => navigate("/admin")}
      onLogout={logout}
    />
  );
}

function readRoute(): Route {
  if (window.location.pathname === "/login") return { name: "login" };
  if (window.location.pathname === "/register") return { name: "register" };
  if (window.location.pathname === "/upload") return { name: "upload" };
  if (window.location.pathname === "/review") return { name: "review" };
  if (window.location.pathname === "/exam-mode") return { name: "exam-mode" };
  if (window.location.pathname === "/admin") return { name: "admin" };

  const match = window.location.pathname.match(/^\/documents\/([^/]+)$/);

  if (match?.[1]) {
    return {
      name: "document-detail",
      documentId: decodeURIComponent(match[1])
    };
  }

  return { name: "documents" };
}

function getCurrentSearchPath() {
  if (window.location.pathname === "/" || window.location.pathname === "/documents") {
    return `/documents${window.location.search}`;
  }

  return "/documents";
}
