import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),

  route("app", "routes/app.tsx", [
    index("routes/app._index.tsx"),

    route("profile", "routes/app.profile.tsx"),
    route("branches", "routes/app.branches.tsx"),

    route("rubros", "routes/app.rubros.tsx", [
      index("routes/app.rubros._index.tsx"),
      route("new", "routes/app.rubros.new.tsx"),
      route(":id", "routes/app.rubros.$id.tsx"),
    ]),

    route("disciplines", "routes/app.disciplines.tsx"),

    route("admin", "routes/app.admin.tsx", [
      index("routes/app.admin._index.tsx"),
      route("rubros", "routes/app.admin.rubros.tsx"),
      route("solicitudes", "routes/app.admin.requests.tsx"),
      route("solicitudes/nueva", "routes/app.admin.requests.new.tsx"),
      route("horarios", "routes/app.admin.horarios.tsx"),
    ]),

    route("dev", "routes/app.dev.tsx"),
    route("user", "routes/app.user.tsx"),
    route("instructor", "routes/app.instructor.tsx"),
  ]),

  route("rubros", "routes/rubros.tsx"),
] satisfies RouteConfig;
