-- =========================================================================
-- INSTRUCCIONES EN DBeAVER:
-- 1. Ejecuta primero esta línea para crear la base de datos si no existe:
--    CREATE DATABASE ProductosAppDb;
--
-- 2. En DBeaver, cambia la conexión activa a "ProductosAppDb" (en el selector de base de datos)
--    o haz clic derecho sobre la conexión -> "Change active database" -> "ProductosAppDb".
--
-- 3. Ejecuta todo el script de abajo para crear las tablas, índices y sembrar datos.
-- =========================================================================

-- =====================================================
-- 1. Tabla Roles
-- =====================================================
IF NOT EXISTS (
    SELECT * 
    FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') 
    AND type = N'U'
)
BEGIN
    CREATE TABLE [dbo].[Roles]
    (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [Nombre] NVARCHAR(50) NOT NULL,
        [Descripcion] NVARCHAR(200) NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [UQ_Roles_Nombre] UNIQUE ([Nombre])
    );
END;

-- =====================================================
-- 2. Tabla Usuarios
-- =====================================================
IF NOT EXISTS (
    SELECT * 
    FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') 
    AND type = N'U'
)
BEGIN
    CREATE TABLE [dbo].[Usuarios]
    (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [Nombre] NVARCHAR(100) NOT NULL,
        [Email] NVARCHAR(256) NOT NULL,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [RolId] UNIQUEIDENTIFIER NOT NULL,
        [Estado] BIT NOT NULL DEFAULT 1,
        [FechaCreacion] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [PK_Usuarios] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [UQ_Usuarios_Email] UNIQUE ([Email]),
        CONSTRAINT [FK_Usuarios_Roles_RolId] FOREIGN KEY ([RolId]) REFERENCES [dbo].[Roles]([Id]) ON DELETE NO ACTION
    );
END;

-- =====================================================
-- 3. Tabla Productos
-- =====================================================
IF NOT EXISTS (
    SELECT * 
    FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[dbo].[Productos]')
    AND type = N'U'
)
BEGIN
    CREATE TABLE [dbo].[Productos]
    (
        [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [Nombre] NVARCHAR(150) NOT NULL,
        [Descripcion] NVARCHAR(MAX) NULL,
        [Precio] DECIMAL(18,2) NOT NULL,
        [Estado] BIT NOT NULL DEFAULT 1,
        [UsuarioCreacionId] UNIQUEIDENTIFIER NOT NULL,
        [FechaCreacion] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        [UsuarioModificacionId] UNIQUEIDENTIFIER NULL,
        [FechaModificacion] DATETIME2(7) NULL,
        CONSTRAINT [PK_Productos] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Productos_Usuarios_Creacion] FOREIGN KEY ([UsuarioCreacionId]) REFERENCES [dbo].[Usuarios]([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Productos_Usuarios_Modificacion] FOREIGN KEY ([UsuarioModificacionId]) REFERENCES [dbo].[Usuarios]([Id]) ON DELETE NO ACTION
    );
END;

-- =====================================================
-- 4. Índices para optimización de consultas (Ajustados con verificaciones condicionales)
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Productos_Nombre' AND object_id = OBJECT_ID('dbo.Productos'))
BEGIN
    CREATE INDEX IX_Productos_Nombre ON dbo.Productos(Nombre);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Productos_Estado' AND object_id = OBJECT_ID('dbo.Productos'))
BEGIN
    CREATE INDEX IX_Productos_Estado ON dbo.Productos(Estado);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Productos_FechaCreacion' AND object_id = OBJECT_ID('dbo.Productos'))
BEGIN
    CREATE INDEX IX_Productos_FechaCreacion ON dbo.Productos(FechaCreacion);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Usuarios_RolId' AND object_id = OBJECT_ID('dbo.Usuarios'))
BEGIN
    CREATE INDEX IX_Usuarios_RolId ON dbo.Usuarios(RolId);
END;

-- =====================================================
-- 5. Datos Semilla (Seed Data)
-- =====================================================
DECLARE @AdminRolId UNIQUEIDENTIFIER = 'A1111111-1111-1111-1111-111111111111';
DECLARE @UsuarioRolId UNIQUEIDENTIFIER = 'B2222222-2222-2222-2222-222222222222';
DECLARE @SuperAdminId UNIQUEIDENTIFIER = 'C3333333-3333-3333-3333-333333333333';

-- Insertar Roles
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = @AdminRolId)
    INSERT INTO [dbo].[Roles] ([Id], [Nombre], [Descripcion]) 
    VALUES (@AdminRolId, 'Admin', 'Rol de Administrador con privilegios completos de lectura, escritura, edición y eliminación.');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Id] = @UsuarioRolId)
    INSERT INTO [dbo].[Roles] ([Id], [Nombre], [Descripcion]) 
    VALUES (@UsuarioRolId, 'Usuario', 'Rol de Usuario estándar con permisos de lectura y creación de productos.');

-- Insertar Usuario super_admin
IF NOT EXISTS (SELECT 1 FROM [dbo].[Usuarios] WHERE [Email] = 'superadmin@productosapp.com')
BEGIN
    INSERT INTO [dbo].[Usuarios] ([Id], [Nombre], [Email], [PasswordHash], [RolId], [Estado], [FechaCreacion])
    VALUES (
        @SuperAdminId, 
        'super_admin', 
        'superadmin@productosapp.com', 
        '$2a$11$NJ5yFWjCgVi.lGwJCFvKZOTTF5ArM23Im/1tUYtrtwg8LL2iMuZRW', -- Hash BCrypt de "SuperAdmin2026!"
        @AdminRolId, 
        1, -- Activo
        GETUTCDATE()
    );
END;