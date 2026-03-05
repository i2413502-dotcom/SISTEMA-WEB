-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-03-2026 a las 04:30:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `agroveterinaria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargo`
--

CREATE TABLE `cargo` (
  `id_cargo` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargo`
--

INSERT INTO `cargo` (`id_cargo`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Asistente de ventas', 'Apoyo en atención al cliente', 'ACTIVO'),
(2, 'Administrador', 'Encargado del sistema', 'ACTIVO'),
(3, 'Vendedor', 'Encargado de ventas', 'ACTIVO'),
(4, 'Gerente', 'Encargado general del negocio', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_producto`
--

CREATE TABLE `categoria_producto` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria_producto`
--

INSERT INTO `categoria_producto` (`id_categoria`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Alimentos', 'Productos alimenticios para mascotas', 'ACTIVO'),
(2, 'Medicamentos', 'Productos veterinarios', 'ACTIVO'),
(3, 'Accesorios', 'Accesorios para mascotas', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `id_persona` int(11) DEFAULT NULL,
  `id_tipo_documento` int(11) DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `id_persona`, `id_tipo_documento`, `numero_documento`, `fecha_registro`) VALUES
(1, 1, 1, '12345678', '2026-02-23 23:23:47'),
(2, 2, 2, '20123456789', '2026-02-23 23:23:47'),
(3, 4, 1, '87654321', '2026-02-23 23:23:59'),
(4, 5, 1, '73995336', '2026-03-03 23:07:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colaborador`
--

CREATE TABLE `colaborador` (
  `id_colaborador` int(11) NOT NULL,
  `id_persona` int(11) DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `id_cargo` int(11) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `colaborador`
--

INSERT INTO `colaborador` (`id_colaborador`, `id_persona`, `dni`, `id_cargo`, `usuario`, `estado`) VALUES
(1, 3, '44556677', 2, 'admin', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comprobante`
--

CREATE TABLE `comprobante` (
  `id_comprobante` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `fecha_emision` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `archivo_pdf` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comprobante`
--

INSERT INTO `comprobante` (`id_comprobante`, `id_pedido`, `serie`, `numero`, `fecha_emision`, `archivo_pdf`) VALUES
(1, 1, 'B001', '000123', '2026-02-23 23:23:48', 'comprobante1.pdf'),
(2, 2, 'B001', '000002', '2026-03-04 00:25:14', NULL),
(3, 3, 'B001', '000003', '2026-03-04 01:23:38', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id_detalle`, `id_pedido`, `id_producto`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 1, 120.00, 120.00),
(2, 1, 2, 1, 35.00, 35.00),
(3, 2, 2, 2, 35.00, 70.00),
(4, 2, 1, 4, 120.00, 480.00),
(5, 3, 1, 1, 120.00, 120.00),
(6, 3, 3, 3, 20.00, 60.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_tipo_pago` int(11) DEFAULT NULL,
  `fecha_pago` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `monto` decimal(10,2) DEFAULT NULL,
  `estado` enum('PENDIENTE','COMPLETADO','RECHAZADO') DEFAULT NULL,
  `codigo_transaccion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id_pago`, `id_pedido`, `id_tipo_pago`, `fecha_pago`, `monto`, `estado`, `codigo_transaccion`) VALUES
(1, 1, 1, '2026-02-23 23:23:48', 155.00, 'COMPLETADO', 'TXN123456'),
(2, 2, 1, '2026-03-04 00:25:14', 555.00, 'COMPLETADO', '123456789'),
(3, 3, 1, '2026-03-04 01:23:38', 185.00, 'COMPLETADO', '12345678798090');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_zona` int(11) DEFAULT NULL,
  `id_tipo_comprobante` int(11) DEFAULT NULL,
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `total` decimal(10,2) DEFAULT NULL,
  `costo_envio` decimal(10,2) DEFAULT NULL,
  `direccion_entrega` varchar(200) DEFAULT NULL,
  `estado` enum('PENDIENTE','PAGADO','ENVIADO','ENTREGADO','CANCELADO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `id_cliente`, `id_zona`, `id_tipo_comprobante`, `fecha_pedido`, `total`, `costo_envio`, `direccion_entrega`, `estado`) VALUES
(1, 1, 1, 1, '2026-02-23 23:23:48', 155.00, 5.00, 'Av. Lima 123', 'PAGADO'),
(2, 1, 1, 1, '2026-03-04 00:25:14', 555.00, 5.00, 'cerrito N°140 pasaje mesetas huancayo', 'PENDIENTE'),
(3, 1, 1, 1, '2026-03-04 01:23:38', 185.00, 5.00, 'cerrito N°140 pasaje mesetas huancayo', 'PENDIENTE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `id_persona` int(11) NOT NULL,
  `nombres` varchar(100) DEFAULT NULL,
  `apellido_paterno` varchar(100) DEFAULT NULL,
  `apellido_materno` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`id_persona`, `nombres`, `apellido_paterno`, `apellido_materno`, `telefono`, `correo`, `direccion`, `estado`, `fecha_creacion`, `password`) VALUES
(1, 'Juan', 'Perez', 'Lopez', '987654321', 'juan@gmail.com', 'Av. Lima 123', 'ACTIVO', '2026-03-03 23:24:02', '$2b$10$j9xGyemEQo1C2wKKq.KvA.dTFkonEsNdn4/Ejm6oT0/j1dq97awfq'),
(2, 'Maria', 'Gomez', 'Torres', '912345678', 'maria@gmail.com', 'Av. Arequipa 456', 'ACTIVO', '2026-03-03 23:24:02', '$2b$10$j9xGyemEQo1C2wKKq.KvA.dTFkonEsNdn4/Ejm6oT0/j1dq97awfq'),
(3, 'Carlos', 'Ramirez', 'Diaz', '998877665', 'carlos@gmail.com', 'Av. Peru 789', 'ACTIVO', '2026-03-03 23:24:02', '$2b$10$j9xGyemEQo1C2wKKq.KvA.dTFkonEsNdn4/Ejm6oT0/j1dq97awfq'),
(4, 'Merly Soledad', 'Castro', 'Galvez', '999888777', 'merly@gmail.com', 'Av. Primavera 321', 'ACTIVO', '2026-03-03 23:24:02', '$2b$10$j9xGyemEQo1C2wKKq.KvA.dTFkonEsNdn4/Ejm6oT0/j1dq97awfq'),
(5, 'Merly Diana ', 'castro', 'galvez', NULL, 'Dmerly@gmail.com', NULL, 'ACTIVO', '2026-03-03 23:17:43', '$2b$10$8Xj9NZUQfq2t2yjBO6/qruOs.yuGb6Btq.Ycuub/9UzHv0SGaIq4O');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `codigo_barra` varchar(50) DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_tipo_animal` int(11) DEFAULT NULL,
  `stock_actual` int(11) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  `stock_alerta` int(11) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `nombre`, `descripcion`, `imagen`, `precio_venta`, `codigo_barra`, `id_categoria`, `id_tipo_animal`, `stock_actual`, `stock_minimo`, `stock_alerta`, `fecha_vencimiento`, `estado`, `fecha_creacion`) VALUES
(1, 'Croquetas Premium', 'Alimento balanceado para perro', 'croquetas.webp', 120.00, 'ABC123', 1, 1, 45, 10, 5, '2026-12-31', 'ACTIVO', '2026-03-04 01:23:38'),
(2, 'Antipulgas', 'Medicamento para pulgas', 'antipulgas.jpg', 35.00, 'DEF456', 2, 1, 28, 5, 3, '2026-06-30', 'ACTIVO', '2026-03-04 00:25:14'),
(3, 'Collar para gato', 'Collar ajustable', 'collar.webp\r\n', 20.00, 'GHI789', 3, 2, 37, 8, 4, NULL, 'ACTIVO', '2026-03-04 01:23:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_animal`
--

CREATE TABLE `tipo_animal` (
  `id_tipo_animal` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_animal`
--

INSERT INTO `tipo_animal` (`id_tipo_animal`, `nombre`, `estado`) VALUES
(1, 'Perro', 'ACTIVO'),
(2, 'Gato', 'ACTIVO'),
(3, 'Ave', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_comprobante`
--

CREATE TABLE `tipo_comprobante` (
  `id_tipo_comprobante` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_comprobante`
--

INSERT INTO `tipo_comprobante` (`id_tipo_comprobante`, `nombre`, `estado`) VALUES
(1, 'Boleta', 'ACTIVO'),
(2, 'Factura', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_documento`
--

CREATE TABLE `tipo_documento` (
  `id_tipo_documento` int(11) NOT NULL,
  `nombre` varchar(20) DEFAULT NULL,
  `descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_documento`
--

INSERT INTO `tipo_documento` (`id_tipo_documento`, `nombre`, `descripcion`) VALUES
(1, 'DNI', 'Documento Nacional de Identidad'),
(2, 'RUC', 'Registro Único de Contribuyente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_pago`
--

CREATE TABLE `tipo_pago` (
  `id_tipo_pago` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_pago`
--

INSERT INTO `tipo_pago` (`id_tipo_pago`, `nombre`, `estado`) VALUES
(1, 'Billetera digital', 'ACTIVO'),
(2, 'Tarjeta', 'ACTIVO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `zona_envio`
--

CREATE TABLE `zona_envio` (
  `id_zona` int(11) NOT NULL,
  `nombre_zona` varchar(100) DEFAULT NULL,
  `costo_envio` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `zona_envio`
--

INSERT INTO `zona_envio` (`id_zona`, `nombre_zona`, `costo_envio`) VALUES
(1, 'Zona Centro', 5.00),
(2, 'Zona Norte', 8.00),
(3, 'Zona Sur', 10.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`id_cargo`);

--
-- Indices de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD KEY `id_persona` (`id_persona`),
  ADD KEY `id_tipo_documento` (`id_tipo_documento`);

--
-- Indices de la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD PRIMARY KEY (`id_colaborador`),
  ADD KEY `id_persona` (`id_persona`),
  ADD KEY `id_cargo` (`id_cargo`);

--
-- Indices de la tabla `comprobante`
--
ALTER TABLE `comprobante`
  ADD PRIMARY KEY (`id_comprobante`),
  ADD KEY `id_pedido` (`id_pedido`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_tipo_pago` (`id_tipo_pago`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_zona` (`id_zona`),
  ADD KEY `id_tipo_comprobante` (`id_tipo_comprobante`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`id_persona`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_tipo_animal` (`id_tipo_animal`);

--
-- Indices de la tabla `tipo_animal`
--
ALTER TABLE `tipo_animal`
  ADD PRIMARY KEY (`id_tipo_animal`);

--
-- Indices de la tabla `tipo_comprobante`
--
ALTER TABLE `tipo_comprobante`
  ADD PRIMARY KEY (`id_tipo_comprobante`);

--
-- Indices de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  ADD PRIMARY KEY (`id_tipo_documento`);

--
-- Indices de la tabla `tipo_pago`
--
ALTER TABLE `tipo_pago`
  ADD PRIMARY KEY (`id_tipo_pago`);

--
-- Indices de la tabla `zona_envio`
--
ALTER TABLE `zona_envio`
  ADD PRIMARY KEY (`id_zona`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cargo`
--
ALTER TABLE `cargo`
  MODIFY `id_cargo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `colaborador`
--
ALTER TABLE `colaborador`
  MODIFY `id_colaborador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `comprobante`
--
ALTER TABLE `comprobante`
  MODIFY `id_comprobante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_animal`
--
ALTER TABLE `tipo_animal`
  MODIFY `id_tipo_animal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tipo_comprobante`
--
ALTER TABLE `tipo_comprobante`
  MODIFY `id_tipo_comprobante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tipo_documento`
--
ALTER TABLE `tipo_documento`
  MODIFY `id_tipo_documento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tipo_pago`
--
ALTER TABLE `tipo_pago`
  MODIFY `id_tipo_pago` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `zona_envio`
--
ALTER TABLE `zona_envio`
  MODIFY `id_zona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`),
  ADD CONSTRAINT `cliente_ibfk_2` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id_tipo_documento`);

--
-- Filtros para la tabla `colaborador`
--
ALTER TABLE `colaborador`
  ADD CONSTRAINT `colaborador_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`),
  ADD CONSTRAINT `colaborador_ibfk_2` FOREIGN KEY (`id_cargo`) REFERENCES `cargo` (`id_cargo`);

--
-- Filtros para la tabla `comprobante`
--
ALTER TABLE `comprobante`
  ADD CONSTRAINT `comprobante_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `pago_ibfk_2` FOREIGN KEY (`id_tipo_pago`) REFERENCES `tipo_pago` (`id_tipo_pago`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_zona`) REFERENCES `zona_envio` (`id_zona`),
  ADD CONSTRAINT `pedido_ibfk_3` FOREIGN KEY (`id_tipo_comprobante`) REFERENCES `tipo_comprobante` (`id_tipo_comprobante`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_producto` (`id_categoria`),
  ADD CONSTRAINT `producto_ibfk_2` FOREIGN KEY (`id_tipo_animal`) REFERENCES `tipo_animal` (`id_tipo_animal`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
