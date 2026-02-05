import { route, index } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),

  // Layout /app
  route("app", "routes/app.tsx", [
    index("routes/app._index.tsx"),

    route("rubros", "routes/app.rubros.tsx", [
        index("routes/app.rubros._index.tsx"),
        route(":id", "routes/app.rubros.$id.tsx"),
    ]),

    route("admin", "routes/app.admin.tsx"),
    route("dev", "routes/app.dev.tsx"),
    route("instructor", "routes/app.instructor.tsx"),
    route("user", "routes/app.user.tsx"),
  ]),
];
