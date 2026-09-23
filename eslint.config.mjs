import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: [
      "**/admin/courses/**/page.tsx",
      "**/admin/users/**/page.tsx",
      "src/components/CoursePlayer.tsx",
      "src/components/admin/CourseList.tsx",
      "src/components/admin/HeroSliderManagement.tsx",
      "src/components/admin/OrganizationList.tsx",
      "src/components/admin/UserList.tsx",
    ],
    rules: {
      // These legacy screens use effects to synchronize async API responses.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
