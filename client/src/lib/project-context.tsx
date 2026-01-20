import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentProject: null,
  setCurrentProject: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const initializedRef = useRef(false);

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    if (!initializedRef.current) {
      const savedId = localStorage.getItem("selectedProjectId");
      if (savedId) {
        const found = projects.find((p) => p.id === savedId);
        if (found) {
          setCurrentProjectState(found);
          initializedRef.current = true;
          return;
        }
      }
      setCurrentProjectState(projects[0]);
      initializedRef.current = true;
      return;
    }

    if (currentProject) {
      const stillExists = projects.find((p) => p.id === currentProject.id);
      if (!stillExists) {
        setCurrentProjectState(projects[0]);
        localStorage.setItem("selectedProjectId", projects[0].id);
      }
    }
  }, [projects]);

  const setCurrentProject = (project: Project | null) => {
    setCurrentProjectState(project);
    if (project) {
      localStorage.setItem("selectedProjectId", project.id);
    } else {
      localStorage.removeItem("selectedProjectId");
    }
  };

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
