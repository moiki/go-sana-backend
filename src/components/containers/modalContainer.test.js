import {render, screen, QueryArgs} from "@testing-library/react";
import ModalContainer from "./modalContainer";

describe("Modal Container", ()=> {

    it("Should render correctly",
        () => {
            render(<ModalContainer title={"Title"} children={<a>World!</a>} open={true} callback={() => {
            }}/>);

            const hasTitle = screen.getByText('Title');
            const acceptButton = screen.getByRole('button', {
                name: "Aceptar"
            });
            const cancelButton = screen.getByRole('button', {
                name: "Cancelar"
            });
            expect(hasTitle).toBeInTheDocument();
            expect(acceptButton).toBeInTheDocument();
            expect(cancelButton).toBeInTheDocument();
        });

})
