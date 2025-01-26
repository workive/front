import {Route, Routes} from "react-router-dom";
import {SignIn, SignUp} from './Authentication'
import {CreateLeave, LeaveRequests, PendingLeave} from './Leaves'
import {CreateTeam, ImportHolidays, LeavesPage, OfficialHolidays, OrganizationPage, Teams} from './Organization'
import {
    Balance,
    ChangePassword,
    CreateEmployee,
    EmployeeInformation,
    EmployeesPage,
    Home,
    Profile,
    Settings
} from './Users'
import {AuthenticatedRoute} from "../core/components"
import UpdateLeavePolicy from "@/modules/Leaves/Pages/UpdateLeavePolicy.tsx";
import UserUpdatePage from "@/modules/Users/Pages/UserUpdatePage.tsx";

export default function Root() {
    return (
        <>
            <Routes>
                <Route path='/signup' element={<SignUp/>}></Route>
                <Route path='/' element={<AuthenticatedRoute><Home/></AuthenticatedRoute>}></Route>
                <Route path='/signin' element={<SignIn/>}></Route>
                <Route path='/leave/create' element={<AuthenticatedRoute><CreateLeave/></AuthenticatedRoute>}></Route>
                <Route path='/leave/pending' element={<AuthenticatedRoute><PendingLeave/></AuthenticatedRoute>}></Route>
                <Route path='/requests' element={<AuthenticatedRoute><LeaveRequests/></AuthenticatedRoute>}></Route>
                <Route path='/balance' element={<AuthenticatedRoute><Balance/></AuthenticatedRoute>}></Route>
                <Route path='/employees' element={<AuthenticatedRoute><EmployeesPage/></AuthenticatedRoute>}></Route>
                <Route path='/employee/:id/balance'
                       element={<AuthenticatedRoute><EmployeeInformation/></AuthenticatedRoute>}></Route>
                <Route path='/settings' element={<AuthenticatedRoute><Settings/></AuthenticatedRoute>}></Route>
                <Route path='/settings/change-password'
                       element={<AuthenticatedRoute><ChangePassword/></AuthenticatedRoute>}></Route>
                <Route path='/settings/official-holidays'
                       element={<AuthenticatedRoute><OfficialHolidays/></AuthenticatedRoute>}></Route>
                <Route path='/settings/official-holidays/import'
                       element={<AuthenticatedRoute><ImportHolidays/></AuthenticatedRoute>}></Route>
                <Route path='/profile' element={<AuthenticatedRoute><Profile/></AuthenticatedRoute>}></Route>
                <Route path='/employee/create'
                       element={<AuthenticatedRoute><CreateEmployee/></AuthenticatedRoute>}></Route>
                <Route path='/employee/update/:id'
                       element={<AuthenticatedRoute><UserUpdatePage/></AuthenticatedRoute>}></Route>
                <Route path='/organization'
                       element={<AuthenticatedRoute><OrganizationPage/></AuthenticatedRoute>}></Route>
                <Route path='/leaves' element={<AuthenticatedRoute><LeavesPage/></AuthenticatedRoute>}></Route>
                <Route path='/teams' element={<AuthenticatedRoute><Teams/></AuthenticatedRoute>}></Route>
                <Route path='/organization/team/create'
                       element={<AuthenticatedRoute><CreateTeam/></AuthenticatedRoute>}></Route>
                <Route path='/leaves/policy/:id'
                       element={<AuthenticatedRoute><UpdateLeavePolicy/></AuthenticatedRoute>}></Route>
            </Routes>
        </>
    )
}