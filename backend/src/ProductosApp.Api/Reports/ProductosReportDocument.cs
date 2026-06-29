using System.Collections.Generic;
using System.Globalization;
using ProductosApp.Api.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.IO;

namespace ProductosApp.Api.Reports
{
    public class ProductosReportDocument : IDocument
    {
        public IEnumerable<Producto> Productos { get; }

        public ProductosReportDocument(IEnumerable<Producto> productos)
        {
            Productos = productos;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().AlignCenter().Text("Lista de productos activos").FontSize(18).SemiBold();

                page.Content().Column(column =>
                {
                    column.Spacing(5);

                    // Table header
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Text("Nombre").SemiBold();
                        row.RelativeItem().Text("Descripción").SemiBold();
                        row.ConstantItem(90).AlignRight().Text("Precio").SemiBold();
                    });

                    foreach (var p in Productos)
                    {
                        column.Item().Row(r =>
                        {
                            r.RelativeItem().Text(p.Nombre ?? string.Empty);
                            r.RelativeItem().Text(p.Descripcion ?? string.Empty);
                            r.ConstantItem(90).AlignRight().Text(p.Precio.ToString("F2", CultureInfo.InvariantCulture));
                        });
                    }
                });

                page.Footer().AlignCenter().Text("Prueba tecnica-1").FontSize(10);
            });
        }

        // Genera el PDF en memoria y devuelve los bytes
        public byte[] GeneratePdf()
        {
            using var ms = new MemoryStream();
            var document = QuestPDF.Fluent.Document.Create(container => Compose(container));
            document.GeneratePdf(ms);
            return ms.ToArray();
        }
    }
}
