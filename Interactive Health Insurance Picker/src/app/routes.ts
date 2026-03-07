import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { WelcomePage } from "./components/WelcomePage";
import { QuizFlow } from "./components/QuizFlow";
import { ResultsPage } from "./components/ResultsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: WelcomePage },
      { path: "quiz", Component: QuizFlow },
      { path: "results", Component: ResultsPage },
    ],
  },
]);
