import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import Login from "./Login";
import UsersPage from "./UsersPage";
import LandingPage from "./LandingPage";
import ContactPage from "./ContactPage";
import HowItWorksPage from "./HowItWorksPage";
import Plans from "./Plans";
import ProfilePage from "./ProfilePage";
import ShareDashboard from "./ShareDashboard";
import GuestAccessPage from "./GuestAccessPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/dashboard",
    element: <DirectoryView />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/how-it-works",
    element: <HowItWorksPage />,
  },
  {
    path: "/plans",
    element: <Plans />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/share",
    element: <ShareDashboard />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/guest/access/:id",
    element: <GuestAccessPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
