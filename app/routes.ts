import { route, index } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),

  route("rubros", "routes/rubros.tsx"),

  route("app", "routes/app.tsx", [
    index("routes/app._index.tsx"),
    route("profile", "routes/app.profile.tsx"),
    route("disciplines", "routes/app.disciplines.tsx"),

    route("rubros", "routes/app.rubros.tsx", [
      index("routes/app.rubros._index.tsx"),
      route(":id", "routes/app.rubros.$id.tsx"),
    ]),

    route("branches", "routes/app.branches.tsx"),

    // ✅ Admin con subrutas
    route("admin", "routes/app.admin.tsx", [
      index("routes/app.admin._index.tsx"),
      route("horarios", "routes/app.admin.horarios.tsx"),
      route("solicitudes", "routes/app.admin.requests.tsx"),
      route("solicitudes/nueva", "routes/app.admin.requests.new.tsx"),
    ]),

    route("dev", "routes/app.dev.tsx"),
    route("instructor", "routes/app.instructor.tsx"),
    route("user", "routes/app.user.tsx"),
  ]),
];